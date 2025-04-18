# README

## インストール

インストール手順はNECコンソ側を参照してください。

## 環境変数

環境変数の説明と設定値例を記載します。

| 項目名                               | 環境変数名                                |説明                                                           |設定値例                                   |
|--------------------------------------|-------------------------------------------|---------------------------------------------------------------|-------------------------------------------|
| APIエンドポイントURL                 | NUXT_PUBLIC_API_BASE_URL                  | A-1-5_離着陸場・機体管理のAPIのエンドポイントのURLです        | https://<API GatewayのFQDN>/asset/api     |
| 地図表示緯度                         | NUXT_PUBLIC_BASE_CENTER_LAT               | 地図を表示したときの中心の緯度です                            | 35.9904                                   |
| 地図表示経度                         | NUXT_PUBLIC_BASE_CENTER_LON               | 地図を表示したときの中心の経度です                            | 139.0858                                  |
| 地図表示倍率                         | NUXT_PUBLIC_BASE_ZOOM                     | 地図を表示したときの標準倍率です                              | 10                                        |
| 地図タイルURL                        | NUXT_PUBLIC_MAP_TILE_URL                  | 地図タイルを表示するためのURLです。XYZ形式で指定してください  | ―                                        |
| 最小ズーム値                         | NUXT_PUBLIC_MAP_MIN_ZOOM                  | 地図の最小のズーム値です                                      | 5                                         |
| 最大ズーム値                         | NUXT_PUBLIC_MAP_MAX_ZOOM                  | 地図の最大のズーム値です                                      | 19                                        |
| 最大境界南端                         | NUXT_PUBLIC_MAX_BOUND_SOUTH               | 地図の南端の値です                                            | 20                                        |
| 最大境界西端                         | NUXT_PUBLIC_MAX_BOUND_WEST                | 地図の西端の値です                                            | 122                                       |
| 最大境界北端                         | NUXT_PUBLIC_MAX_BOUND_NORTH               | 地図の北端の値です                                            | 50                                        |
| 最大境界東端                         | NUXT_PUBLIC_MAX_BOUND_EAST                | 地図の東端の値です                                            | 153                                       |
| 緊急着陸場アイコンカラー             | NUXT_PUBLIC_EMERGENCY_ICON_COLOR          | 緊急着陸場のアイコン色です                                    | red                                       |
| 使用可離着陸場アイコンカラー         | NUXT_PUBLIC_DRONE_PORT_ICON_COLOR         | 離着陸場が使用可の場合のアイコン色です                        | green                                     |
| 使用不可離着陸場アイコンカラー       | NUXT_PUBLIC_NOT_AVAILABLE_PORT_ICON_COLOR | 離着陸場が使用不可の場合のアイコン色です                      | grey                                      |
| 準備中離着陸場アイコンカラー         | NUXT_PUBLIC_PREPARATION_PORT_ICON_COLOR   | 離着陸場が準備中の場合のアイコン色です                        | orange                                    |
| メンテナンス中離着陸場アイコンカラー | NUXT_PUBLIC_MAINTENANCE_PORT_ICON_COLOR   | 離着陸場がメンテナンス中の場合のアイコン色です                | yellow                                    |
| ポートアイコン大サイズ               | NUXT_PUBLIC_LARGE_PORT_ICON_SIZE   	   | 離着陸場アイコンの大サイズの大きさです                        | 60                                        |
| ポートアイコン大中切替ズーム閾値     | NUXT_PUBLIC_ZOOM_THRESHOLD_LM       	   | 離着陸場アイコンの大中サイズの切替閾値です                    | 12                                        |
| ポートアイコン中サイズ               | NUXT_PUBLIC_MEDIUM_PORT_ICON_SIZE         | 離着陸場アイコンの中サイズの大きさです                        | 45                                        |
| ポートアイコン中小切替ズーム閾値     | NUXT_PUBLIC_ZOOM_THRESHOLD_MS             | 離着陸場アイコンの中小サイズの切替閾値です                    | 9                                         |
| ポートアイコン小サイズ               | NUXT_PUBLIC_SMALL_PORT_ICON_SIZE          | 離着陸場アイコンの小サイズの大きさです                        | 30                                        |
```
