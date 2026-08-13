package com.eldercare.eldercare.service;

import com.eldercare.eldercare.config.S3Config;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {
    private final S3Client s3Client;
    private final S3Config s3Config;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public String uploadPhoto(UUID userId, MultipartFile file) throws IOException {
        // generate unique key for the file
        String key = "users/" + userId + "/photo/" + UUID.randomUUID() + getExtension(file);

        s3Client.putObject(
                PutObjectRequest.builder()
                        .bucket(bucket)
                        .key(key)
                        .contentType(file.getContentType())
                        .build(),
                RequestBody.fromBytes(file.getBytes())
        );
        
        // return the public URL
        return "https://" + bucket + ".s3." + s3Config.getRegion() + ".amazonaws.com/" + key;
    }

    public void deletePhoto(String photoUrl) {
        // extract key from URL
        String key = photoUrl.substring(photoUrl.indexOf("users/"));

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build());
    }

    private String getExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return ".jpg";
    }

}
