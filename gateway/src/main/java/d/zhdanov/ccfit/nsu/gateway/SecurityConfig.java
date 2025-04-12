package d.zhdanov.ccfit.nsu.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {
  @Value("${spring.security.oauth2.resource server.jwt.jwk-set-uri}")
  private String jwkSetUri;
  
  @Bean
  SecurityWebFilterChain securityFilterChain(ServerHttpSecurity httpSecurity)
  throws Exception {
    return httpSecurity.authorizeExchange(
        auth -> auth
          .pathMatchers(HttpMethod.OPTIONS, "/graphql").permitAll()
          .pathMatchers("/graphql").permitAll()
          .anyExchange().authenticated()
      ).oauth2ResourceServer(
        oauth2 -> oauth2.jwt(jwt -> jwt.jwkSetUri(jwkSetUri)))
      .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
      .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
      .csrf(ServerHttpSecurity.CsrfSpec::disable).build();
  }
}
