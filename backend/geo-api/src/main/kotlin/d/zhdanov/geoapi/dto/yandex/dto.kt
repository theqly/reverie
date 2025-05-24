package d.zhdanov.geoapi.dto.yandex
data class YandexGeoResponse(
  val response: GeoResponse
)

data class GeoResponse(
  val GeoObjectCollection: GeoObjectCollection
)

data class GeoObjectCollection(
  val featureMember: List<FeatureMember>
)

data class FeatureMember(
  val GeoObject: GeoObject
)

data class GeoObject(
  val metaDataProperty: MetaDataProperty,
  val name: String,
  val description: String,
  val uri: String,
  val Point: Point
)

data class MetaDataProperty(
  val GeocoderMetaData: GeocoderMetaData
)

data class GeocoderMetaData(
  val precision: String,
  val text: String,
  val kind: String,
  val Address: Address
)

data class Address(
  val country_code: String,
  val formatted: String,
  val postal_code: String
)

data class Point(
  val pos: String // "37.609865 55.750119"
)
