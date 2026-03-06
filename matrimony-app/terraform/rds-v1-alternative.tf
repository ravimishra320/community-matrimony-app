# Alternative: Aurora Serverless v1 with Auto-Pause
# This reduces idle costs to ~$32/month (NAT Gateway only)
# 
# To use this:
# 1. Rename rds.tf to rds-v2.tf.backup
# 2. Rename this file to rds.tf
# 3. Run terraform apply

resource "aws_rds_cluster" "main" {
  cluster_identifier      = "${var.app_name}-${var.environment}-cluster"
  engine                  = "aurora-postgresql"
  engine_mode             = "serverless"  # v1 instead of v2
  engine_version          = "13.12"       # v1 supports up to 13.x
  database_name           = "matrimony"
  master_username         = var.db_master_username
  master_password         = var.db_master_password
  
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [aws_security_group.aurora.id]
  
  # Serverless v1 scaling with auto-pause
  scaling_configuration {
    auto_pause               = true
    seconds_until_auto_pause = 300  # Pause after 5 minutes of inactivity
    min_capacity             = 2    # Minimum ACUs when active
    max_capacity             = 4    # Maximum ACUs
    timeout_action           = "ForceApplyCapacityChange"
  }

  # Backup configuration
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  
  # Maintenance
  preferred_maintenance_window = "mon:04:00-mon:05:00"
  
  # Encryption
  storage_encrypted = true
  
  # Skip final snapshot for dev
  skip_final_snapshot = var.environment != "prod"
  final_snapshot_identifier = var.environment == "prod" ? "${var.app_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}" : null

  # Note: v1 does NOT support HTTP endpoint
  # enable_http_endpoint = false

  tags = {
    Name = "${var.app_name}-${var.environment}-aurora-cluster"
    Note = "Serverless v1 with auto-pause for cost savings"
  }
}

# Note: v1 does NOT need cluster instances
# The cluster itself handles everything

# Secrets Manager for DB credentials (same as v2)
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

# Cost comparison output
output "cost_savings_note" {
  value = <<-EOT
    Aurora Serverless v1 Configuration:
    - Auto-pauses after 5 minutes of inactivity
    - Idle cost: $0 (only NAT Gateway ~$32/month)
    - Active cost: 2-4 ACUs × $0.06/ACU-hour
    - Cold start: 30-60 seconds when resuming
    
    Trade-offs vs v2:
    ✓ Much cheaper when idle ($0 vs $43/month)
    ✗ Longer cold starts (30-60s vs instant)
    ✗ Less predictable performance
    ✗ Older technology (v1 vs v2)
  EOT
}
