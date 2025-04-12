package d.zhdanov.ccfit.nsu.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class UserInfoHeaderFactory
  extends AbstractGatewayFilterFactory<Object> {
  
  public static List<String> getFrontendResourceClaims(Jwt jwt) {
    Map<String, Object> resourceAccess =
      jwt.getClaim(CustomHeaders.RESOURCE_ACCESS_CLAIM);
    if(resourceAccess == null) {
      return Collections.emptyList();
    }
    resourceAccess = (Map<String, Object>) resourceAccess.get(
      CustomHeaders.CONSTRUCTION_SYSTEM_CLAIM
    );
    if(resourceAccess != null) {
      return (List<String>) resourceAccess.getOrDefault(
        CustomHeaders.ROLE_CLAIM, Collections.emptyList()
      );
    }
    return Collections.emptyList();
  }
  
  @Override
  public GatewayFilter apply(Object config) {
    return (exchange, chain) -> ReactiveSecurityContextHolder.getContext()
      .map(SecurityContext::getAuthentication)
      .cast(JwtAuthenticationToken.class).flatMap(auth -> {
        final var jwt      = auth.getToken();
        final var usrRoles = String.join(",", getFrontendResourceClaims(jwt));
        ServerHttpRequest modifiedRequest = exchange.getRequest().mutate()
          .headers(httpHeaders -> httpHeaders.remove(HttpHeaders.AUTHORIZATION))
          .header(CustomHeaders.USER_ID_HEADER, jwt.getSubject())
          .header(CustomHeaders.USER_ROLES_HEADER, usrRoles)
          .header(
            CustomHeaders.USER_EMAIL_HEADER,
            jwt.getClaimAsString(CustomHeaders.EMAIL_CLAIM)
          )
          .build();
        return chain.filter(exchange.mutate().request(modifiedRequest).build());
      });
  }
}