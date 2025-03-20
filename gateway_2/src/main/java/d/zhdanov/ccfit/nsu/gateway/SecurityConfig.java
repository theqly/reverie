package d.zhdanov.ccfit.nsu.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebFluxSecurity
public class SecurityConfig {
  @Value("${spring.security.oauth2.resource server.jwt.jwk-set-uri}")
  private String jwkSetUri;
  
  public String getJwkSetUri() {
    return jwkSetUri;
  }
  
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity)
  throws Exception {
    return httpSecurity.csrf(AbstractHttpConfigurer::disable)
      .httpBasic(AbstractHttpConfigurer::disable).authorizeHttpRequests(
        auth -> auth.requestMatchers("/public/**").permitAll() // Публичный API
          .anyRequest().authenticated()
        // Все остальные запросы требуют аутентификации
      ).oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwkSetUri(
        jwkSetUri)))
      .build();
  }
  
}
