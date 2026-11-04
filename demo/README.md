# PortoBikes demo

A Docker container running nginx that serves the PortoBikes booking page, managed by Terraform. It runs entirely on your laptop: no cloud account, no cost.

## Setup (macOS)

```sh
brew install hashicorp/tap/terraform   # not plain `brew install terraform`, which installs an old version
brew install colima docker             # or install Docker Desktop instead
colima start
```

If you use Colima (or any Docker that isn't at `/var/run/docker.sock`), tell Terraform where Docker is:

```sh
export DOCKER_HOST=$(docker context inspect -f '{{.Endpoints.docker.Host}}')
```

Then, from this folder:

```sh
docker pull nginx:alpine   # pre-pull so the live demo doesn't depend on Wi-Fi
terraform init
```

Tested with Terraform 1.17.1, `kreuzwerker/docker` 4.6.0 and Colima 0.10.3 on macOS (Apple silicon).

## Script

1. `terraform apply`: open http://localhost:8080
2. Change the price in `main.tf`, then `terraform plan -out=tfplan`: the container "must be replaced"
3. `terraform apply tfplan`: refresh the page
4. `docker rm -f portobikes-web`: the server "dies"
5. `terraform plan`: Terraform notices and plans to recreate it
6. `terraform apply`: the page is back
7. `terraform destroy`

The narration for each step is in `../outline.md`, turning point 3.

## Run it with OpenTofu

Install it with `brew install opentofu`. Tested with OpenTofu 1.13.5.

With the infrastructure created by Terraform still running, `tofu init && tofu plan` reads Terraform's state and reports `No changes. Your infrastructure matches the configuration.` This is used in the debate at turning point 5.

One catch: Terraform and OpenTofu download the provider from different registries, and each tool's `init` rewrites `.terraform.lock.hcl` to its own registry. After running `tofu init`, run `terraform init` again before going back to `terraform`. Don't commit the lock file that `tofu init` writes.
