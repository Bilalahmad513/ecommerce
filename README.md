# ECommerceApp (.NET)

Beginner-friendly full-stack e-commerce project, 100% .NET. Two separate projects:

- **Backend/** — ASP.NET Core Web API (products, categories, login/register, orders). Owns the database.
- **Frontend/** — ASP.NET Core MVC (the website people see: shop, cart, checkout, admin panel). Talks to Backend over HTTP.

This project is completely separate from `quickvee-admin-panel/` in this same folder — that's a different, unrelated existing project.

## 1. Install what you need (one-time)

1. **.NET 8 SDK** — download from https://dotnet.microsoft.com/download/dotnet/8.0 (choose the SDK, not just the runtime). After installing, restart your terminal and check it worked:
   ```
   dotnet --version
   ```
   should print something like `8.0.x`.
2. **SQL Server Express** (a real, named SQL Server instance — not LocalDB) — install "SQL Server 2022 Express" from Microsoft if you don't already have it, and make sure the instance is named `SQLEXPRESS` (that's the default). This is what `Backend/appsettings.json`'s connection string (`Server=.\SQLEXPRESS`) points at, and it's also what lets you open the database directly in **SQL Server Management Studio (SSMS)** — connect with server name `.\SQLEXPRESS` (or `(local)\SQLEXPRESS`) and Windows Authentication.
3. **EF Core CLI tool** (used to create the database tables):
   ```
   dotnet tool install --global dotnet-ef
   ```

## 2. First-time setup (run once)

From the `ECommerceApp` folder:

```powershell
# Restore both projects
dotnet restore

# Create the database migration (generates the SQL table definitions)
dotnet ef migrations add InitialCreate --project Backend --startup-project Backend

# Apply it to LocalDB (creates the actual database)
dotnet ef database update --project Backend --startup-project Backend
```

If `dotnet ef` says it's not found, close and reopen your terminal after step 1.3, or run `dotnet tool restore` first.

## 3. Run the app (every time)

You need **two terminals** open at the same time, one per project.

**Terminal 1 — Backend:**
```powershell
cd Backend
dotnet run
```
Leave this running. It listens on `http://localhost:5000` (Swagger UI opens automatically at `/swagger` so you can see the API).

**Terminal 2 — Frontend:**
```powershell
cd Frontend
dotnet run
```
Leave this running too. Open `http://localhost:5100` in your browser — that's the actual store.

> The Backend must be running before the Frontend can load products, log in, or check out.

## 4. Try it out

- Browse products on the home page, filter by category.
- Add items to your cart (works without logging in).
- Register a new customer account, then check out from the cart.
- Log in as the seeded **admin** account to manage products:
  - Email: `admin@ecommerce.com`
  - Password: `Admin@123`
  - Once logged in, a "Manage Products" link appears in the top nav → add/edit/delete products there.

Sample categories (Electronics, Clothing, Books) and a few sample products are seeded automatically the first time the Backend runs.

## Project layout

```
ECommerceApp/
  ECommerceApp.sln
  Backend/     — Web API, EF Core, Identity + JWT, database seeding
  Frontend/    — MVC website, calls Backend over HTTP, session-based cart
  README.md
```

## Notes for later

- Connection string is in `Backend/appsettings.json`. Change it if you point at a different SQL Server instance.
- The JWT signing key in `Backend/appsettings.json` is a placeholder — fine for local learning, but never ship a real app with a hardcoded secret checked into source control.
- To reset the database, delete it via SQL Server Object Explorer (or `dotnet ef database drop --project Backend --startup-project Backend`) and re-run `dotnet ef database update`.
