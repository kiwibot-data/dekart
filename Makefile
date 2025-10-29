app-deploy:
	gcloud app deploy app.yaml

# app-deploy:
# 	BUCKET=${BUCKET} \
# 	PROJECT_ID=${PROJECT_ID} \
# 	MAPBOX_TOKEN=${MAPBOX_TOKEN} \
# 	CORS_ORIGIN=${CORS_ORIGIN} \
# 	DB_INSTANCE_NAME=${DB_INSTANCE_NAME} \
# 	envsubst < app.example.yaml > app.yaml
# 	gcloud app deploy app.yaml
