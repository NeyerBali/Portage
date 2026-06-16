# ---- Build ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore Porteo.sln
RUN dotnet publish Porteo.Api/Porteo.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
# QuestPDF/SkiaSharp (génération des PDF de facture) nécessite fontconfig sur Linux.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libfontconfig1 \
    && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish .
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "Porteo.Api.dll"]
