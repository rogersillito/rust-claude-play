use trpl::{Either, Html};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let urls = &args[1..];

    if urls.is_empty() || urls.len() > 4 {
        eprintln!("Usage: {} <url1> [url2] [url3] [url4]", args[0]);
        std::process::exit(1);
    }

    trpl::block_on(async {
        let (url, maybe_title) = match urls {
            [a] => page_title(a).await,
            [a, b] => match trpl::select(page_title(a), page_title(b)).await {
                Either::Left(result) => result,
                Either::Right(result) => result,
            },
            [a, b, c] => {
                let first_two = trpl::select(page_title(a), page_title(b));
                match trpl::select(first_two, page_title(c)).await {
                    Either::Left(Either::Left(result)) => result,
                    Either::Left(Either::Right(result)) => result,
                    Either::Right(result) => result,
                }
            }
            [a, b, c, d] => {
                let first_two = trpl::select(page_title(a), page_title(b));
                let last_two = trpl::select(page_title(c), page_title(d));
                match trpl::select(first_two, last_two).await {
                    Either::Left(Either::Left(result)) => result,
                    Either::Left(Either::Right(result)) => result,
                    Either::Right(Either::Left(result)) => result,
                    Either::Right(Either::Right(result)) => result,
                }
            }
            _ => unreachable!(),
        };

        println!("{url} returned first");
        match maybe_title {
            Some(title) => println!("Its page title was: '{title}'"),
            None => println!("It had no title."),
        }
    })
}

async fn page_title(url: &str) -> (&str, Option<String>) {
    let response_text = trpl::get(url).await.text().await;
    let title = Html::parse(&response_text)
        .select_first("title")
        .map(|title| title.inner_html());
    (url, title)
}