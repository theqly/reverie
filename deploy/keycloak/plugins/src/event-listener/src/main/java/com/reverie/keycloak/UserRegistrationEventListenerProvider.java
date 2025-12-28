package com.reverie.keycloak;

import org.keycloak.events.Event;
import org.keycloak.events.EventListenerProvider;
import org.keycloak.events.EventType;
import org.keycloak.events.admin.AdminEvent;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

public class UserRegistrationEventListenerProvider implements EventListenerProvider {

    private static final String INTERNAL_SECRET = "super-secret-key-123";
    private final KeycloakSession session;
    private static final String API_URL = "http://router:4000/"; 

    public UserRegistrationEventListenerProvider(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public void onEvent(Event event) {
        if (EventType.REGISTER.equals(event.getType())) {
            String userId = event.getUserId();
            RealmModel realm = session.getContext().getRealm();
            UserModel user = session.users().getUserById(realm, userId);

            if (user != null) {
                String email = user.getEmail();
                String username = user.getUsername();
                
                java.util.concurrent.CompletableFuture.runAsync(() -> {
                    sendCreateUserRequest(userId, email, username);
                });
            }
        }
    }

    private void sendCreateUserRequest(String userId, String email, String username) {
        String jsonPayload = "{" +
            "\"query\": \"mutation CreateUser($input: CreateUserInput!) { createUser(input: $input) { id } }\"," +
            "\"variables\": {" +
                "\"input\": {" +
                    "\"userId\": \"" + userId + "\"," +
                    "\"email\": \"" + email + "\"," +
                    "\"nickname\": \"" + username + "\"," +
                    "\"nick_tag\": \"" + username + "\"" +
                "}" +
            "}" +
        "}";

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(API_URL))
                .header("Content-Type", "application/json")
                .header("X-Internal-Secret", INTERNAL_SECRET) 
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        try {
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            System.out.println("User synced to backend. Status: " + response.statusCode());
            if (response.statusCode() >= 400) {
                System.err.println("Failed to sync user: " + response.body());
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("Error sending request to backend: " + e.getMessage());
        }
    }

    @Override
    public void onEvent(AdminEvent adminEvent, boolean includeRepresentation) {
        // ignore
    }

    @Override
    public void close() {
    }
}