# Build stage
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

WORKDIR /src

COPY ["multisnake-server.sln", "./"]
COPY ["multisnake-server/", "multisnake-server/"]

RUN dotnet restore
RUN dotnet publish -c Release -o /app

# Deployment
FROM mcr.microsoft.com/dotnet/aspnet:7.0

WORKDIR /app

COPY --from=build /app .

EXPOSE 8000 8001

ENTRYPOINT ["dotnet", "multisnake-server.dll"]
