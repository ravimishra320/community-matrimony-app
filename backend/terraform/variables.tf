variable "region" {
  description = "AWS Region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project Name"
  default     = "community-matrimony"
}

variable "stage" {
  description = "Deployment Stage (dev/prod)"
  default     = "dev"
}
