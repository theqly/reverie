package d.zhdanov.geoapi.fetchers

import com.netflix.graphql.dgs.DgsComponent
import com.netflix.graphql.dgs.DgsEntityFetcher
import com.netflix.graphql.dgs.DgsQuery
import com.netflix.graphql.dgs.InputArgument
import d.zhdanov.geoapi.codegen.DgsConstants
import d.zhdanov.geoapi.codegen.types.CommonParams
import d.zhdanov.geoapi.codegen.types.PlaceData
import d.zhdanov.geoapi.codegen.types.Point
import d.zhdanov.geoapi.codegen.types.PointInput
import d.zhdanov.geoapi.service.YandexGeoService
import kotlinx.coroutines.reactor.mono
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import reactor.core.publisher.Mono

private val logger: Logger = LoggerFactory.getLogger(GeoFetcher::class.java)
private val onePoint = CommonParams(resultsQ = 1);

@DgsComponent
class GeoFetcher(
	private val geoService: YandexGeoService
) {
	private val log = logger

	@DgsQuery
	fun placeInfo(
		@InputArgument point: PointInput, @InputArgument params: CommonParams?
	): Mono<List<PlaceData>> = mono {
		logger.debug("(point {}, params {})", point, params)
//		listOf(PlaceData("xz", lat, lon, "xyi", "pizda", "yebok"))
		geoService.getPlaceInfo(point, params)
	}

	@DgsEntityFetcher(name = DgsConstants.PLACEDATA.TYPE_NAME)
	fun placeDataByLatLon(values: Map<String, Any>): Mono<PlaceData> = mono {
		log.debug("(values {})", values)
		val lat = (values[DgsConstants.PLACEDATA.Lat] as? Number)?.toDouble()
			?: error("lat missing")
		val lon = (values[DgsConstants.PLACEDATA.Lon] as? Number)?.toDouble()
			?: error("lon missing")
//		PlaceData("xz", lat, lon, "xyi", "pizda", "yebok")
		geoService.getPlaceInfo(PointInput(lat, lon), onePoint).first()
	}
}