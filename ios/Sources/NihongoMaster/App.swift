import SwiftUI
import WebKit

@main
struct NihongoMasterApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark)
        }
    }
}

struct ContentView: View {
    @State private var webAppURL: URL = URL(string: "https://tiengnhat.vercel.app") ?? URL(string: "https://nihongomaster.vercel.app")!

    var body: some View {
        ZStack {
            Color.black
                .ignoresSafeArea()

            NihongoWebView(url: webAppURL)
                .ignoresSafeArea(.all, edges: .all)
        }
    }
}

struct NihongoWebView: UIViewRepresentable {
    let url: URL

    func makeUIView(context: Context) -> WKWebView {
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true

        let config = WKWebViewConfiguration()
        config.defaultWebpagePreferences = preferences
        config.allowsInlineMediaPlayback = true
        config.mediaTypesRequiringUserActionForPlayback = []

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.isOpaque = false
        webView.backgroundColor = .black
        webView.scrollView.backgroundColor = .black
        webView.scrollView.bounces = true
        webView.allowsBackForwardNavigationGestures = true

        let request = URLRequest(url: url, cachePolicy: .useProtocolCachePolicy, timeoutInterval: 30)
        webView.load(request)

        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}
}
