package d.zhdanov.geoapi.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.function.client.WebClient

@Configuration
class GeoWebClientConfig {
  @Bean
  fun webClient(
    @Value("\${env.geoApiUrl}") geoApiUrl: String
  ): WebClient = WebClient.builder().baseUrl(geoApiUrl).build()
}
