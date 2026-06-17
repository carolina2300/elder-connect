package com.eldercare.eldercare.exception;

public class ReviewAlreadyExistsException extends RuntimeException {
    public ReviewAlreadyExistsException() {
        super("You have already reviewed this user");
    }
}
