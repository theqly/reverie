package d.zhdanov.ccfit.nsu.gateway;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class AddUserInfoHeaderGatewayFilterFactory
  extends AbstractGatewayFilterFactory<Object> {
  
  public static String USER_ID_HEADER    = "X-User-Id";
  public static String USER_EMAIL_HEADER = "X-User-Email";
  public static String USER_ROLES_HEADER = "X-User-Roles";
  
  @Override
  public GatewayFilter apply(Object config) {
    return (exchange, chain) -> ReactiveSecurityContextHolder.getContext().map(
        securityContext -> securityContext.getAuthentication().getPrincipal())
      .cast(Jwt.class).flatMap(jwt -> {
        exchange.getRequest().mutate().header(USER_ID_HEADER, jwt.getSubject())
          .header(USER_EMAIL_HEADER, jwt.getClaimAsString("email")).header(
            USER_ROLES_HEADER,
            String.join(",", jwt.getClaimAsStringList("roles"))
          ).build();
        return chain.filter(exchange);
      });
  }
}