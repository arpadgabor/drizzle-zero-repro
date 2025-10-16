#!/bin/bash

curl -sS https://starship.rs/install.sh | sh -s -- -y
echo "eval \"\$(starship init zsh)\"" >> ~/.zshrc
# echo "unset NODE_OPTIONS" >> ~/.zshrc
cat .devcontainer/nvm_autoload.sh >> ~/.zshrc

source ${NVM_DIR}/nvm.sh

nvm install && nvm use && npm i -g pnpm

docker compose pull
docker compose up -d

pnpm install
