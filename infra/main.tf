terraform {
  # Local backend — tfstate is machine-local and NOT committed to the repo
  # (*.tfstate is in .gitignore). Each operator maintains their own state file.
  # Scale path: migrate to S3 backend + DynamoDB state lock when the team
  # grows or CI/CD takes ownership of apply:
  #   backend "s3" {
  #     bucket         = "ren-ai-tfstate"
  #     key            = "terraform.tfstate"
  #     region         = var.aws_region
  #     dynamodb_table = "ren-ai-tfstate-lock"
  #     encrypt        = true
  #   }
  backend "local" {}

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  required_version = ">= 1.6"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project = "ren-ai"
    }
  }
}

# ACM certificates for CloudFront must be requested in us-east-1 regardless of
# where the rest of the stack lives.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project = "ren-ai"
    }
  }
}
