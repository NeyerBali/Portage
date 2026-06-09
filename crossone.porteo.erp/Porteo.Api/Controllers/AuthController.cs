using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Porteo.Api.Helpers;
using Porteo.ModelViews.Users;
using Porteo.Services;
using QRCoder;

namespace Porteo.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IServices _services;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IServices services, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _services = services;
            _configuration = configuration;
            _logger = logger;
        }

        private AuthResultDto Issue(Porteo.Models.Users.User user)
        {
            var token = _services.Users.CreateToken(user, _configuration.GetSection("AppSettings:Token").Value);
            return new AuthResultDto
            {
                Token = token.Token,
                FullName = $"{user.Prenom} {user.Nom}".Trim(),
                Email = user.Email,
                Role = user.Role,
                ConsultantId = user.ConsultantId,
                ExpiresAt = token.ExpiresAt,
            };
        }

        /// <summary>Étape 1 : vérifie les identifiants puis demande la double authentification.</summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            var user = await _services.Users.Authenticate(request.Email, request.Password);
            if (user == null)
            {
                _logger.LogInformation("Échec de connexion pour {Email}", request.Email);
                return BadRequest(new { message = "Email ou mot de passe incorrect." });
            }

            return Ok(new TwoFactorChallengeDto
            {
                NeedsTwoFactor = true,
                HasTotp = user.TotpEnabled,
                Email = user.Email,
                FullName = $"{user.Prenom} {user.Nom}".Trim(),
            });
        }

        /// <summary>Méthode « email » : génère et envoie le code de vérification.</summary>
        [HttpPost("send-verification")]
        public async Task<IActionResult> SendVerification([FromBody] EmailDto dto)
        {
            var user = await _services.Users.FindByEmail(dto.Email);
            if (user == null) return BadRequest(new { message = "Utilisateur introuvable." });
            var code = await _services.Users.StartEmailChallenge(user);
            try
            {
                _services.Mail.SendVerificationCode($"{user.Prenom} {user.Nom}".Trim(), user.Email, code);
                return Ok(new { message = "Code envoyé par email." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Envoi du code 2FA échoué pour {Email}", dto.Email);
                return StatusCode(500, new { message = "Impossible d'envoyer l'email. Réessayez." });
            }
        }

        /// <summary>Méthode « email » : vérifie le code et délivre le jeton.</summary>
        [HttpPost("verify")]
        public async Task<IActionResult> Verify([FromBody] VerifyCodeDto dto)
        {
            var user = await _services.Users.FindByEmail(dto.Email);
            if (user == null) return BadRequest(new { message = "Utilisateur introuvable." });
            if (!_services.Users.VerifyEmailCode(user, dto.Code))
                return BadRequest(new { message = "Code invalide ou expiré." });
            return Ok(Issue(user));
        }

        /// <summary>Méthode « authentificateur » : vérifie le code TOTP et délivre le jeton.</summary>
        [HttpPost("verify-totp")]
        public async Task<IActionResult> VerifyTotp([FromBody] VerifyCodeDto dto)
        {
            var user = await _services.Users.FindByEmail(dto.Email);
            if (user == null) return BadRequest(new { message = "Utilisateur introuvable." });
            if (!_services.Users.VerifyTotpForUser(user, dto.Code))
                return BadRequest(new { message = "Code de l'authentificateur invalide." });
            return Ok(Issue(user));
        }

        /// <summary>Profil de l'utilisateur connecté.</summary>
        [Authorize]
        [HttpGet("me")]
        public async Task<ActionResult<MeDto>> Me()
        {
            var me = await _services.Users.GetMe(User.GetUserId());
            return me == null ? NotFound() : Ok(me);
        }

        [Authorize]
        [HttpPost("profile")]
        public async Task<ActionResult<MeDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            try { var me = await _services.Users.UpdateProfile(User.GetUserId(), dto); return me == null ? NotFound() : Ok(me); }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        [Authorize]
        [HttpPost("change-password")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            try
            {
                var ok = await _services.Users.ChangePassword(User.GetUserId(), dto.CurrentPassword, dto.NewPassword);
                return ok ? Ok(new { message = "Mot de passe mis à jour." }) : NotFound();
            }
            catch (ArgumentException ex) { return BadRequest(new { message = ex.Message }); }
        }

        // ---- Authentificateur (TOTP) ----
        /// <summary>Génère un secret + QR code pour configurer l'application d'authentification.</summary>
        [Authorize]
        [HttpGet("setup-totp")]
        public async Task<IActionResult> SetupTotp()
        {
            var me = await _services.Users.GetMe(User.GetUserId());
            if (me == null) return Unauthorized();
            var secret = _services.Users.GenerateTotpSecret();
            var uri = _services.Users.GetTotpUri(secret, me.Email, "Porteo");

            using var gen = new QRCodeGenerator();
            var data = gen.CreateQrCode(uri, QRCodeGenerator.ECCLevel.M);
            var png = new PngByteQRCode(data).GetGraphic(8);
            var qrImage = "data:image/png;base64," + Convert.ToBase64String(png);

            await _services.Users.SaveTotp(User.GetUserId(), secret, false); // pas encore activé
            return Ok(new TotpSetupResultDto { Secret = secret, QrUri = uri, QrImage = qrImage });
        }

        /// <summary>Confirme l'activation de l'authentificateur avec le 1ᵉʳ code.</summary>
        [Authorize]
        [HttpPost("confirm-totp")]
        public async Task<IActionResult> ConfirmTotp([FromBody] CodeDto dto)
        {
            var user = await _services.Users.ReadById(User.GetUserId());
            if (user == null || string.IsNullOrEmpty(user.TotpSecret))
                return BadRequest(new { message = "Aucune configuration en attente." });
            if (!_services.Users.VerifyTotpCode(user.TotpSecret, dto.Code))
                return BadRequest(new { message = "Code invalide. Réessayez." });
            await _services.Users.SaveTotp(user.Id, user.TotpSecret, true);
            return Ok(new { message = "Authentificateur activé." });
        }

        [Authorize]
        [HttpPost("disable-totp")]
        public async Task<IActionResult> DisableTotp()
        {
            await _services.Users.SaveTotp(User.GetUserId(), null, false);
            return Ok(new { message = "Authentificateur désactivé." });
        }

        // ---- Mot de passe oublié / réinitialisation ----
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            var user = await _services.Users.FindByEmail(dto.Email);
            if (user != null)
            {
                var token = await _services.Users.CreateResetToken(user);
                var url = $"{FrontUrl()}/auth/reset?token={token}";
                try { _services.Mail.SendPasswordReset($"{user.Prenom} {user.Nom}".Trim(), user.Email, url); }
                catch (Exception ex) { _logger.LogError(ex, "Envoi email reset échoué"); }
            }
            // Pas d'énumération des comptes.
            return Ok(new { message = "Si un compte existe, un email de réinitialisation a été envoyé." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var user = await _services.Users.FindByResetToken(dto.Token);
            if (user == null) return BadRequest(new { message = "Lien invalide ou expiré." });
            if (string.IsNullOrWhiteSpace(dto.NewPassword) || dto.NewPassword.Length < 6)
                return BadRequest(new { message = "Mot de passe trop court (6 caractères min.)." });
            await _services.Users.SetPassword(user, dto.NewPassword);
            return Ok(new { message = "Mot de passe défini. Vous pouvez vous connecter." });
        }

        private string FrontUrl() => (_configuration["App:FrontUrl"] ?? "http://localhost:4200").TrimEnd('/');
    }
}
