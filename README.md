# codefolio

## Project setup

```bash
bun run setup
```

### Compiles and hot-reloads for development

```bash
bun run app
```

### Compiles and minifies for production

```bash
bun run build
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Full Setup Guide

### 1. Prerequisites

- **Bun**: Install from [https://bun.sh/](https://bun.sh/)
- **MongoDB**: Local or cloud instance
- **Node.js**: (if needed for some tools)
- **Docker**: (optional, for containerized setup)

### 2. Clone the Repository

```pwsh
# In PowerShell
git clone <your-repo-url>
cd CodeFolio
```

### 3. Install Dependencies

```pwsh
bun install
cd server
bun install
cd ..
```

### 4. Environment Variables

Create a `.env` file in the `server/` directory:

```env
MONGO_URI=mongodb://localhost:27017/codefolio
JWT_SECRET=your_jwt_secret
PORT=3001
FRONTEND_URL=http://localhost:3000
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

### 5. Setup Public and Encrypted Private Keys

Generate RSA keys for JWT/encryption:

```pwsh
openssl genrsa -out server/private_encrypted.key 2048
openssl rsa -in server/private_encrypted.key -pubout -out server/public.key
```

### 6. Set Passphrase for Private Key (Optional)

```pwsh
openssl genrsa -aes256 -out server/private_encrypted.key 2048
```

- Enter a passphrase when prompted.
- Update backend config to use the passphrase when reading the key.

### 7. Setup Public Folder

- Place `favicon.ico`, `robots.txt`, and any static assets in `public/`.

### 8. Run the Project

#### Development

```pwsh
bun run setup
bun run app
```

#### Production Build

```pwsh
bun run build
```

### 9. Access the App

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:3001](http://localhost:3001)

### 10. Docker Setup (Optional)

```pwsh
docker-compose up --build
```

### 11. Troubleshooting

- Ensure MongoDB is running and accessible
- Check `.env` values
- Keys must be in `server/` and readable
- If using a passphrase, backend must be configured to use it

### 12. Other Notes

- For email features, configure SMTP credentials in `.env`
- For OAuth, set up Google/Facebook credentials if needed

---