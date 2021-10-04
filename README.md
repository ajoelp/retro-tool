# RetroTool

[![codecov](https://codecov.io/gh/ajoelp/retro-tool/branch/main/graph/badge.svg?token=XSUW0861R1)](https://codecov.io/gh/ajoelp/retro-tool)
[![API](https://github.com/ajoelp/retro-tool/actions/workflows/api.yml/badge.svg?branch=main)](https://github.com/ajoelp/retro-tool/actions/workflows/api.yml)
[![API](https://github.com/ajoelp/retro-tool/actions/workflows/client.yml/badge.svg?branch=main)](https://github.com/ajoelp/retro-tool/actions/workflows/client.yml)

## Development

1. Copy the `.env.example` to `.env`
2. **Github OAuth**
   1. Go to https://github.com/settings/developers and create a new OAuth app
   2. Set **Homepage URL** to `http://localhost:4200`
   3. Set **Authorization callback URL** to `http://localhost:3333/auth/github/callback`
   4. Use the Client ID and Client Secret in your `.env` file
3. Start the database servers using docker `docker-compose up`
4. Start the client server `yarn start client`
5. Start the api server `yarn start api`
6. Run the migrations `yarn prisma migrate dev`
