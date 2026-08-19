FROM eclipse-temurin:21-jre

# AWS Lambda Web Adapter
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:1.0.1 \
     /lambda-adapter \
     /opt/extensions/lambda-adapter

WORKDIR /app

COPY target/*.jar eldercare.jar

ENV PORT=8080

EXPOSE 8080

CMD ["java", "-jar", "eldercare.jar"]