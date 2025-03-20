package d.zhdanov.ccfit.nsu.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

public class Config {
  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
    return httpSecurity.csrf(AbstractHttpConfigurer::disable)
      .httpBasic(AbstractHttpConfigurer::disable)
      .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
      .oauth2ResourceServer(oauth2ResourceServer -> oauth2ResourceServer.jwt(
        Customizer.withDefaults()))
      .build();
  }
}
