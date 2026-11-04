terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "4.6.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name         = "nginx:alpine"
  keep_locally = true
}

resource "docker_container" "web" {
  name  = "portobikes-web"
  image = docker_image.nginx.image_id

  ports {
    internal = 80
    external = 8080
  }

  upload {
    file    = "/usr/share/nginx/html/index.html"
    content = "<h1>PortoBikes</h1><p>Book your bike: 5 EUR per hour</p>"
  }
}
