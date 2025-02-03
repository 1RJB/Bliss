# filepath: /Bliss/Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Bliss/Bliss.csproj", "Bliss/"]
RUN dotnet restore "Bliss/Bliss.csproj"
COPY . .
WORKDIR "/src/Bliss"
RUN dotnet build "Bliss.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Bliss.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Bliss.dll"]