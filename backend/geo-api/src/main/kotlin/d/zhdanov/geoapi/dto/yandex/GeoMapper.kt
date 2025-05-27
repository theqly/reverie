package d.zhdanov.geoapi.dto.yandex

import d.zhdanov.geoapi.codegen.types.PlaceData
import org.mapstruct.Mapper
import org.mapstruct.MappingConstants

@Mapper(
  componentModel = MappingConstants.ComponentModel.SPRING
)
abstract class GeoMapper {
  fun toPlaceData(featureMember: FeatureMember): PlaceData {
    val geo = featureMember.GeoObject
    val meta = geo.metaDataProperty.GeocoderMetaData
    val pos = geo.Point.pos.split(" ")
    val lon = pos[0].toDouble()
    val lat = pos[1].toDouble()
    
    return PlaceData(
      id = geo.uri,
      lat = lat,
      lon = lon,
      kind = meta.kind,
      descr = geo.description,
      addr = meta.Address.formatted
    )
  }
  
  abstract fun toPlaceData(members: List<FeatureMember>): List<PlaceData>
}
