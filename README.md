

# RetroTool

[![codecov](https://codecov.io/gh/ajoelp/retro-tool/branch/main/graph/badge.svg?token=XSUW0861R1)](https://codecov.io/gh/ajoelp/retro-tool)
[![API](https://github.com/ajoelp/retro-tool/actions/workflows/api.yml/badge.svg?branch=main)](https://github.com/ajoelp/retro-tool/actions/workflows/api.yml)
[![API](https://github.com/ajoelp/retro-tool/actions/workflows/client.yml/badge.svg?branch=main)](https://github.com/ajoelp/retro-tool/actions/workflows/client.yml)

## Development

### Starting the API

Start the api using docker-compose

```bash
docker-compose up
```

### Starting the client

```bash
yarn start
```

## Planning

- [ ] User can create a new board
- [ ] User is prompted to provide a name
- [ ] User is given a unique UUID and stored in localstorage
- [ ] Owner can modify the name of the board
- [ ] Index is generated with default template
- [ ] Owner can modify column titles
- [ ] User can add cards to board
- [ ] Owner can lock the board
