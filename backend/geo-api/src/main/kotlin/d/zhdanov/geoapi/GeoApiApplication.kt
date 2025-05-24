package d.zhdanov.geoapi

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class GeoApiApplication

fun main(args: Array<String>) {
  runApplication<GeoApiApplication>(*args)
}
