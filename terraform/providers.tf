provider aws {
    region  = "eu-central-1"
    profile = "default"
}

terraform {
    backend "s3" {
        bucket = "pallad-terraform-state"
        key    = "config"
        region = "eu-central-1"
    }
}
