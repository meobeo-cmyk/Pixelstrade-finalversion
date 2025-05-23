# Pixelstrade

**Pixelstrade** is a pixel-style trade platform designed for gamers, freelancers, and small businesses. It lets users create accounts, join or host trade sessions using custom codes, and categorize their offers based on type (online/offline, game/business).

## Features

- Quick account creation: username, name, email, age, password.
- Trade room system: generate room codes and invite others.
- Trade classification: online/offline, game-related/business-related.
- Pixel-style UI, optimized for mobile devices.
- Clean structure with separate frontend (React), backend (Flask), and shared resources.

---

## Project Structure

Pixelstrade-finalversion/ │ ├── Client/src/              # Frontend - Vite + React │   ├── index.html │   ├── package.json │   ├── vite.config.js │   └── components/ │ ├── Server/                  # Backend - Flask │   ├── main.py │   ├── requirements.txt │   ├── .env.example │   └── Procfile │ ├── Shared/                  # Shared logic/resources │   └── .gitkeep │ └── README.md


---


### Frontend (React)

```bash
cd Client/src
npm install
npm run dev

Backend (Flask)

cd Server
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py

> Copy .env.example to .env and update if needed.




---

Deployment

Frontend (Vercel or Netlify)

Root directory: Client/src

Build command: npm run build

Output directory: dist


Backend (Railway / Render / Heroku)

Upload the Server folder.

Railway auto-detects Flask with requirements.txt.

Heroku requires Procfile.



---

Environment Variables

.env.example:

PORT=5000
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173


---

TODOs

[ ] Add JWT authentication

[ ] Improve desktop UI

[ ] Trade tag filtering (coming soon)

[ ] Admin panel for managing rooms/users

[ ] Write English API documentation



---

Dev Team

Tran Duc Long — Frontend, UI lead, system architect

meobeo-cmyk — Backend dev, pixel aesthetic wizard



---

License

MIT License

---
