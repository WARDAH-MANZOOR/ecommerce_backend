# Migration Guide

## Moving Existing Code to Backend Folder

If you have existing code in root `src/` folder, follow these steps:

### Manual Move

1. Create backend folder structure:
```bash
mkdir -p backend/src
```

2. Move all files from `src/` to `backend/src/`:
```bash
# Windows PowerShell
Move-Item -Path src\* -Destination backend\src\ -Force

# Linux/Mac
mv src/* backend/src/
```

3. Move configuration files:
```bash
# Move prisma.config.ts to backend/ (if exists)
# Move .env to backend/ (if exists)
```

4. Install backend dependencies:
```bash
cd backend
npm install
```

## After Migration

1. Update `.env` file location - move it to `backend/.env`
2. Update any absolute paths in your code
3. Test backend:
```bash
cd backend
npm run dev
```
