package d.zhdanov.geoapi.service

import d.zhdanov.geoapi.codegen.types.CommonParams
import d.zhdanov.geoapi.codegen.types.PlaceData
import d.zhdanov.geoapi.codegen.types.PointInput
import d.zhdanov.geoapi.dto.yandex.GeoMapper
import d.zhdanov.geoapi.dto.yandex.YandexGeoResponse
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.web.reactive.function.client.awaitBody

const val API_KEY_QP = "apikey"
const val GEOCODE_QP = "geocode"
const val FORMAT_QP = "format"
const val RESULTS_QP = "results"
const val FORMAT_TYPE = "json"

private val logger: Logger =
  LoggerFactory.getLogger(YandexGeoService::class.java)

@Service
class YandexGeoService(
  @Autowired private val geoMapper: GeoMapper,
  @Autowired private val webClient: WebClient,
  @Value("\${env.geoApiKey}") private val apiKey: String,
) {
  suspend fun getPlaceInfo(
    point: PointInput, params: CommonParams?
  ): List<PlaceData> {
    val geocode = "${point.lon},${point.lat}"
    val response = webClient.get().uri { builder ->
      builder.queryParam(API_KEY_QP, apiKey)
        .queryParam(GEOCODE_QP, geocode)
        .queryParam(FORMAT_QP, FORMAT_TYPE)
      params?.resultsQ?.let { builder.queryParam(RESULTS_QP, it) }
      
      builder.build()
    }.retrieve().awaitBody<YandexGeoResponse>()
    return geoMapper.toPlaceData(response.response.GeoObjectCollection.featureMember)
  }
}