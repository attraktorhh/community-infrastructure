# check if bun is installed, install it if not
if ! command -v bun &> /dev/null
then
  echo "Bun is not installed, installing..."
  curl -fsSL https://bun.sh/install | bash
fi

# install dependencies using lockfile
bun install --frozen-lockfile

# run the cli using `bun run dev -- <all args passed to the cli>`
bun run dev -- $@