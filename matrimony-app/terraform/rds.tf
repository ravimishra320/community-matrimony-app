# Aurora Serverless v2 PostgreSQL Cluster
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "${var.app_name}-${var.environment}-cluster"
  engine                  = "aurora-postgresql"
  engine_mode             = "provisioned"
  engine_version          = "15.4"
  database_name           = "matrimony"
  master_username         = var.db_master_username
  master_password         = var.db_master_password
  
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.aurora.id]
  
  # Serverless v2 scaling
  serverlessv2_scaling_configuration {
    max_capacity = 2.0
    min_capacity = 0.5
  }

  # Backup configuration
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  
  # Maintenance
  preferred_maintenance_window = "mon:04:00-mon:05:00"
  
  # Encryption
  storage_encrypted = true
  
  # Skip final snapshot for dev (change for prod)
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.app_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Enable HTTP endpoint for Data API (optional)
  enable_http_endpoint = true

  tags = {
    Name = "${var.app_name}-${var.environment}-aurora-cluster"
  }
}

# Aurora Serverless v2 Instance
resource "aws_rds_cluster_instance" "main" {
  identifier         = "${var.app_name}-${var.environment}-instance-1"
  cluster_identifier = aws_rds_cluster.main.id
  instance_class     = "db.serverless"
  engine             = aws_rds_cluster.main.engine
  engine_version     = aws_rds_cluster.main.engine_version

  publicly_accessible = false

  tags = {
    Name = "${var.app_name}-${var.environment}-aurora-instance"
  }
}

# Secrets Manager for DB credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name        = "${var.app_name}-${var.environment}-db-credentials"
  description = "Database credentials for Aurora cluster"

  tags = {
    Name = "${var.app_name}-${var.environment}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_master_username
    password = var.db_master_password
    host     = aws_rds_cluster.main.endpoint
    port     = 5432
    dbname   = aws_rds_cluster.main.database_name
  })
}
