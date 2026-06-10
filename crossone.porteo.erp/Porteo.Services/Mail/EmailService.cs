using System.Net.Http;
using System.Text;
using System.Text.Json;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace Porteo.Services.Mail
{
    public interface IEmailService
    {
        void SendVerificationCode(string userName, string toEmail, string code);
        void SendWelcomeConsultant(string userName, string toEmail, string setPasswordUrl);
        void SendPasswordReset(string userName, string toEmail, string resetUrl);
    }

    /// <summary>Envoi d'emails via Brevo (SMTP relay), même intégration que l'ERP de référence pfe.</summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public void SendVerificationCode(string userName, string toEmail, string code)
        {
            var html = $@"
<!DOCTYPE html><html><head><meta charset='utf-8'></head>
<body style='font-family:Arial,sans-serif;background:#F6F8F7;margin:0;padding:24px;'>
  <div style='max-width:560px;margin:auto;background:#fff;border:1px solid #DEE4E1;border-radius:14px;overflow:hidden;'>
    <div style='background:#0D1512;padding:24px;text-align:center;'>
      <span style='font-family:Georgia,serif;font-size:22px;color:#3DDC97;font-weight:600;'>Portéo</span>
    </div>
    <div style='padding:28px;color:#243029;'>
      <h2 style='margin:0 0 8px;'>Double authentification</h2>
      <p>Bonjour {userName},</p>
      <p>Votre code de vérification pour vous connecter à Portéo :</p>
      <div style='font-size:34px;font-weight:bold;letter-spacing:10px;text-align:center;color:#0E5C4A;padding:18px;background:#EEFBF4;border-radius:10px;margin:16px 0;'>{code}</div>
      <p style='color:#586860;'>Ce code expire dans <strong>10 minutes</strong>. Si vous n'êtes pas à l'origine de cette connexion, ignorez cet email.</p>
    </div>
  </div>
</body></html>";
            Send(toEmail, "Votre code de connexion Portéo", html);
        }

        public void SendWelcomeConsultant(string userName, string toEmail, string setPasswordUrl)
        {
            var html = $@"
<!DOCTYPE html><html><head><meta charset='utf-8'></head>
<body style='font-family:Arial,sans-serif;background:#F6F8F7;margin:0;padding:24px;'>
  <div style='max-width:560px;margin:auto;background:#fff;border:1px solid #DEE4E1;border-radius:14px;overflow:hidden;'>
    <div style='background:linear-gradient(135deg,#0E5C4A,#23B584);padding:26px;text-align:center;'>
      <span style='font-family:Georgia,serif;font-size:22px;color:#fff;font-weight:600;'>Bienvenue sur Portéo</span>
    </div>
    <div style='padding:28px;color:#243029;'>
      <p>Bonjour <strong>{userName}</strong>,</p>
      <p>Un compte consultant vient d'être créé pour vous sur la plateforme <strong>Portéo</strong>.</p>
      <p>Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à votre espace :</p>
      <div style='text-align:center;margin:26px 0;'>
        <a href='{setPasswordUrl}' style='display:inline-block;padding:14px 30px;background:#0E5C4A;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;'>Définir mon mot de passe</a>
      </div>
      <p style='color:#586860;font-size:13px;'>Ce lien expire dans 48 heures.</p>
    </div>
  </div>
</body></html>";
            Send(toEmail, "Votre accès Portéo est prêt", html);
        }

        public void SendPasswordReset(string userName, string toEmail, string resetUrl)
        {
            var html = $@"
<!DOCTYPE html><html><head><meta charset='utf-8'></head>
<body style='font-family:Arial,sans-serif;background:#F6F8F7;margin:0;padding:24px;'>
  <div style='max-width:560px;margin:auto;background:#fff;border:1px solid #DEE4E1;border-radius:14px;padding:28px;color:#243029;'>
    <h2>Réinitialisation du mot de passe</h2>
    <p>Bonjour {userName},</p>
    <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe Portéo :</p>
    <div style='text-align:center;margin:24px 0;'>
      <a href='{resetUrl}' style='display:inline-block;padding:13px 28px;background:#0E5C4A;color:#fff;text-decoration:none;border-radius:10px;font-weight:bold;'>Réinitialiser mon mot de passe</a>
    </div>
    <p style='color:#586860;font-size:13px;'>Ce lien expire dans 24 heures.</p>
  </div>
</body></html>";
            Send(toEmail, "Réinitialisation de votre mot de passe Portéo", html);
        }

        // HttpClient partagé (évite l'épuisement de sockets). Réutilisé pour l'API Brevo.
        private static readonly HttpClient _http = new HttpClient { Timeout = TimeSpan.FromSeconds(20) };

        private void Send(string toEmail, string subject, string html)
        {
            var apiKey = _config["Brevo:ApiKey"] ?? "";
            var senderEmail = _config["Smtp:SenderEmail"] ?? _config["Smtp:Login"] ?? "";
            var senderName = _config["Email:SenderName"] ?? "Portéo";

            // En prod (Render) le port SMTP sortant est souvent bloqué → on privilégie
            // l'API HTTP de Brevo (HTTPS/443). Repli SMTP si aucune clé d'API n'est fournie (local).
            if (!string.IsNullOrWhiteSpace(apiKey))
                SendViaApi(apiKey, senderName, senderEmail, toEmail, subject, html);
            else
                SendViaSmtp(senderName, senderEmail, toEmail, subject, html);

            _logger.LogInformation("Email envoyé à {Email} — {Subject}", toEmail, subject);
        }

        /// <summary>Envoi via l'API transactionnelle Brevo (nécessite une clé d'API « xkeysib- »).</summary>
        private void SendViaApi(string apiKey, string senderName, string senderEmail, string toEmail, string subject, string html)
        {
            var payload = new
            {
                sender = new { name = senderName, email = senderEmail },
                to = new[] { new { email = toEmail } },
                subject,
                htmlContent = html,
            };
            using var req = new HttpRequestMessage(HttpMethod.Post, "https://api.brevo.com/v3/smtp/email");
            req.Headers.TryAddWithoutValidation("api-key", apiKey);
            req.Headers.TryAddWithoutValidation("accept", "application/json");
            req.Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var resp = _http.Send(req);
            var body = resp.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            if (!resp.IsSuccessStatusCode)
                throw new InvalidOperationException($"Brevo API {(int)resp.StatusCode} : {body}");
        }

        /// <summary>Envoi via SMTP (MailKit) — utilisé en local où le port 587 n'est pas bloqué.</summary>
        private void SendViaSmtp(string senderName, string senderEmail, string toEmail, string subject, string html)
        {
            var login = _config["Smtp:Login"] ?? "";
            var password = _config["Smtp:Password"] ?? "";
            var host = _config["Smtp:Host"] ?? "smtp-relay.brevo.com";
            var port = int.TryParse(_config["Smtp:Port"], out var p) ? p : 587;

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(senderName, senderEmail));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new TextPart("html") { Text = html };

            using var client = new SmtpClient();
            client.Connect(host, port, SecureSocketOptions.StartTls);
            client.Authenticate(login, password);
            client.Send(message);
            client.Disconnect(true);
        }
    }
}
