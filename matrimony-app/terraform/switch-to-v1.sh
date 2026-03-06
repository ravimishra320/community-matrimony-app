#!/bin/bash
# Script to switch from Aurora Serverless v2 to v1 for cost savings

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║  Switch to Aurora Serverless v1 (Cost Savings)        ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if already deployed
if [ ! -f "terraform.tfstate" ]; then
    echo -e "${GREEN}✓ No existing deployment detected${NC}"
    echo -e "${GREEN}  Safe to switch before first deployment${NC}"
    echo ""
    
    # Simple switch
    if [ -f "rds.tf" ]; then
        echo "Backing up current rds.tf..."
        mv rds.tf rds-v2.tf.backup
        echo -e "${GREEN}✓ Backed up to rds-v2.tf.backup${NC}"
    fi
    
    if [ -f "rds-v1-alternative.tf" ]; then
        echo "Activating v1 configuration..."
        mv rds-v1-alternative.tf rds.tf
        echo -e "${GREEN}✓ Aurora Serverless v1 is now active${NC}"
    else
        echo -e "${RED}✗ rds-v1-alternative.tf not found${NC}"
        exit 1
    fi
    
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  Configuration switched successfully!                  ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Review the changes: terraform plan"
    echo "  2. Deploy: terraform apply"
    echo ""
    echo "Cost savings: ~\$43/month when idle"
    echo ""
    exit 0
fi

# If already deployed, need to destroy and recreate
echo -e "${YELLOW}⚠ Existing deployment detected${NC}"
echo ""
echo "This will:"
echo "  1. Destroy your current Aurora v2 cluster"
echo "  2. Create a new Aurora v1 cluster"
echo "  3. You will LOSE ALL DATA unless you backup first"
echo ""
echo -e "${RED}WARNING: This is a destructive operation!${NC}"
echo ""
read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Checking if Aurora endpoint is available..."

# Try to get Aurora endpoint
AURORA_ENDPOINT=$(terraform output -raw aurora_cluster_endpoint 2>/dev/null || echo "")

if [ -n "$AURORA_ENDPOINT" ]; then
    echo -e "${GREEN}✓ Aurora endpoint found: $AURORA_ENDPOINT${NC}"
    echo ""
    read -p "Do you want to backup your database first? (yes/no): " backup_confirm
    
    if [ "$backup_confirm" = "yes" ]; then
        echo ""
        echo "Creating backup..."
        BACKUP_FILE="backup-$(date +%Y%m%d-%H%M%S).sql"
        
        read -p "Enter database username [dbadmin]: " db_user
        db_user=${db_user:-dbadmin}
        
        read -sp "Enter database password: " db_pass
        echo ""
        
        PGPASSWORD=$db_pass pg_dump -h $AURORA_ENDPOINT -U $db_user matrimony > $BACKUP_FILE 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Backup saved to: $BACKUP_FILE${NC}"
        else
            echo -e "${RED}✗ Backup failed. Aborting.${NC}"
            exit 1
        fi
    fi
fi

echo ""
echo "Step 1: Destroying Aurora v2 resources..."
terraform destroy -target=aws_rds_cluster.main -target=aws_rds_cluster_instance.main -auto-approve

echo ""
echo "Step 2: Switching configuration files..."
if [ -f "rds.tf" ]; then
    mv rds.tf rds-v2.tf.backup
    echo -e "${GREEN}✓ Backed up v2 config${NC}"
fi

if [ -f "rds-v1-alternative.tf" ]; then
    mv rds-v1-alternative.tf rds.tf
    echo -e "${GREEN}✓ Activated v1 config${NC}"
else
    echo -e "${RED}✗ rds-v1-alternative.tf not found${NC}"
    exit 1
fi

echo ""
echo "Step 3: Creating Aurora v1 cluster..."
terraform apply -target=aws_rds_cluster.main -auto-approve

echo ""
echo "Step 4: Updating Secrets Manager..."
terraform apply -target=aws_secretsmanager_secret_version.db_credentials -auto-approve

NEW_ENDPOINT=$(terraform output -raw aurora_cluster_endpoint)
echo ""
echo -e "${GREEN}✓ New Aurora v1 endpoint: $NEW_ENDPOINT${NC}"

if [ -n "$BACKUP_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    echo ""
    read -p "Do you want to restore the backup now? (yes/no): " restore_confirm
    
    if [ "$restore_confirm" = "yes" ]; then
        echo ""
        echo "Waiting for Aurora to be ready (this may take 30-60 seconds)..."
        sleep 60
        
        echo "Restoring schema..."
        PGPASSWORD=$db_pass psql -h $NEW_ENDPOINT -U $db_user -d matrimony -f ../database/schema.sql > /dev/null 2>&1
        
        echo "Restoring data..."
        PGPASSWORD=$db_pass psql -h $NEW_ENDPOINT -U $db_user -d matrimony -f $BACKUP_FILE > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Data restored successfully${NC}"
        else
            echo -e "${YELLOW}⚠ Restore had some errors. Check manually.${NC}"
        fi
    fi
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Migration to Aurora v1 complete!                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "Cost savings: ~\$43/month when idle"
echo ""
echo "Aurora v1 will auto-pause after 5 minutes of inactivity."
echo "First connection after pause will take 30-60 seconds."
echo ""
echo "To test auto-pause:"
echo "  aws rds describe-db-clusters \\"
echo "    --db-cluster-identifier matrimony-app-dev-cluster \\"
echo "    --query 'DBClusters[0].Status'"
echo ""
