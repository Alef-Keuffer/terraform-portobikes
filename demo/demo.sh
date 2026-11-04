#!/usr/bin/env bash
# The live PortoBikes demo. Press Enter to type each command, Enter again to run it.
#
# Speakers: each step below names its narration in ../outline.md. Practise those lines;
# the screen only shows a one-line title.
#
# Usage: ./demo.sh        (live)
#        ./demo.sh -d     (no simulated typing, for rehearsing fast)

cd "$(dirname "$0")" || exit 1
. ./vendor/demo-magic.sh
TYPE_SPEED=40
DEMO_PROMPT="${GREEN}portobikes \$ ${COLOR_RESET}"

# Prints a step title immediately, without waiting for Enter.
say() { echo -e "\n${DEMO_COMMENT_COLOR}# $1${COLOR_RESET}"; }

# --- Preflight (not shown as steps) ---------------------------------------
export DOCKER_HOST=$(docker context inspect -f '{{.Endpoints.docker.Host}}' 2>/dev/null)
for tool in terraform tofu docker; do
  command -v $tool >/dev/null || { echo "Missing: $tool (see README.md)"; exit 1; }
done
docker info >/dev/null 2>&1 || { echo "Docker isn't running (try: colima start)"; exit 1; }
lsof -i :8080 >/dev/null 2>&1 && { echo "Port 8080 is busy"; exit 1; }
docker image inspect nginx:alpine >/dev/null 2>&1 || docker pull -q nginx:alpine >/dev/null
terraform init -input=false >/dev/null || exit 1
clear

# === Turning point 3 ========================================================

# Narration: outline.md, turning point 3, step 1
say "Our booking server, written down as code"
pe "cat main.tf"
pe "terraform apply"
pe "curl -s localhost:8080"

# Narration: outline.md, turning point 3, steps 2-3
say "Change one line: the price"
sed -i '' 's/5 EUR per hour/4 EUR per hour - Friday special!/' main.tf
pe "git --no-pager diff main.tf"
pe "terraform plan -out=tfplan"
pe "terraform apply tfplan"
pe "curl -s localhost:8080"

# Narration: outline.md, turning point 3, steps 4-6
say "Friday, 18:00. Someone deletes the server by hand."
pe "docker rm -f portobikes-web"
pe "curl -s localhost:8080 || echo 'Booking server is down!'"
pe "terraform plan"
pe "terraform apply"
pe "curl -s localhost:8080"

say "Back to the slides: turning points 4 and 5. Leave this window open."

# === Turning point 5: the debate ===========================================

# Narration: outline.md, turning point 5, slide 8 (the OpenTofu speaker)
say "Same code, same server, different tool: OpenTofu"
pe "tofu init"
pe "tofu plan"
pe "tofu destroy"

# --- Reset for the next run (not shown) -----------------------------------
git checkout -- main.tf .terraform.lock.hcl
rm -f tfplan
