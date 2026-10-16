// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "NihongoMaster",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .library(
            name: "NihongoMaster",
            targets: ["NihongoMaster"]
        )
    ],
    targets: [
        .target(
            name: "NihongoMaster",
            dependencies: [],
            path: "Sources/NihongoMaster"
        )
    ]
)
