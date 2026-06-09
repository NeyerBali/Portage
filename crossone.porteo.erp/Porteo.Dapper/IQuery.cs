namespace Porteo.Dapper
{
    /// <summary>
    /// Contrat d'une requête de lecture Dapper par domaine
    /// (même esprit que l'IQueries de l'ERP de référence).
    /// </summary>
    public interface IQuery
    {
        /// <summary>Nom de la table principale interrogée.</summary>
        string GetTableName();
        /// <summary>Requête de lecture côté administrateur (vue globale).</summary>
        string GetManagerQuery();
        /// <summary>Requête de lecture filtrée pour un consultant donné.</summary>
        string GetConsultantQuery(int consultantId);
    }
}
