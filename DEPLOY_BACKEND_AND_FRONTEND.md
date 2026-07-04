## Deploying Servio Backend (Render) and Frontend (Vercel) with MongoDB Atlas

This guide walks through:
- Creating a MongoDB Atlas cluster and obtaining `MONGO_URI`.
- Migrating existing JSON data into Atlas.
- Deploying the backend to Render and the frontend to Vercel.

---

1) Create MongoDB Atlas cluster
- Signup at https://www.mongodb.com/cloud/atlas and create a free cluster.
- Create a database user (username + password) and note credentials.
- Under Network Access, allow your IP or use `0.0.0.0/0` for quick testing (not secure).
- In "Databases" → "Connect" → "Connect your application" copy the connection string. Replace `<password>` and `<dbname>` with your values. Example:

```
mongodb+srv://servio_user:MyStrongPassword@cluster0.abcd1.mongodb.net/servio?retryWrites=true&w=majority
```

Set this value aside as `MONGO_URI`.

2) Prepare backend locally
- From repo root, install backend deps and migrate data:

```bash
cd backend
npm install
# create a .env file with at least MONGO_URI and JWT_SECRET
echo "MONGO_URI=your_mongo_uri_here" >> .env
echo "JWT_SECRET=some_long_secret_here" >> .env

# run the migration (imports backend/data/users.json into Mongo)
npm run migrate-mongo

# start server locally to confirm everything works
npm run dev
```

Notes:
- The backend was updated to attempt connecting to MongoDB at startup when `MONGO_URI` is set. If no `MONGO_URI` is present, it will fall back to the existing file-based LocalDB.
- Migration script currently seeds users from `backend/data/users.json`. You can extend it to import providers/requests/transactions similarly.

3) Deploy backend to Render
- Push your repo to GitHub.
- On https://render.com create a new Web Service and connect your GitHub repo.
- Set the Root directory to `backend` (so Render installs deps in that folder).
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables in Render dashboard (Settings → Environment):
  - `MONGO_URI` = (your Atlas connection string)
  - `JWT_SECRET` = (your jwt secret)
  - Any other secrets (SMTP credentials etc.)
- Deploy. After deploy, note the public URL (e.g., `https://servio-backend.onrender.com`). The API root is `https://.../api`.

4) Migrate data (if not run locally)
- Option A (recommended): Run migration locally with `MONGO_URI` pointing to Atlas (see step 2). This seeds Atlas before the Render app runs.
- Option B: Use a Render one-off job / shell to run `npm run migrate-mongo` after setting `MONGO_URI` in Render.

5) Deploy frontend to Vercel
- In Vercel, import your GitHub repo and set the Root Directory to `frontend`.
- In project settings → Environment Variables, add:
  - `VITE_API_URL` = `https://your-backend-url.onrender.com/api`
- Build settings:
  - Build Command: `npm run build`
  - Output Directory: `dist`
- Deploy; Vercel will build and publish your frontend.

6) Verify
- Open the Vercel URL and test login/profile/wallet flows.
- Verify network requests hit your Render backend and responses come from Mongo (use browser devtools / Render logs).

7) Next improvements (optional)
- Convert LocalDB usage to Mongoose models across the backend to fully switch to Mongo.
- Add additional migration scripts for providers, requests, transactions.
- Add automated backups for your Atlas DB and restrict network access properly.

---

If you want, I can now:
- Create migration scripts for providers/requests/transactions.
- Update backend routes to use Mongoose models (full migration).
- Produce a `.render.yaml` for Render or a `vercel.json` config for Vercel.
