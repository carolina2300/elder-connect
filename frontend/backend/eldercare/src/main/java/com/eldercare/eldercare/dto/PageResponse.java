package com.eldercare.eldercare.dto;

import java.util.List;

/**
 * Matches the frontend PageResponse contract:
 * { content, page, size, totalElements, totalPages }.
 * Note: page is zero-based.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {}
