# LM Benchmark Transparency


As a beginner researcher, I find it challenging to interpret benchmark results. Most of the time, even the benchmark itself is new to me, I don't know what the data distribution looks like.

Even though Huggingface does a great job in displaying the dataset through the dataset viewer, it takes some effort to calculate the expected accuracies, and is inconvenient when I'm filtering and skimming through research papers to see which ones worth deep reading.

I believe, most of the time, we try to interpret benchmark results as if the data distribution is uniform. But this is not always the case. 

In order to make it easier for me to interpret the results section in research papers, I thought of making a simple tool to compute the data distribution, and along with it, a simple public webpage to show the distribution, majority class accuracy, uniform random accuracy and proportional random accuracy for reference. Link to [LM Benchmark Transparency webpage](https://xwong22.github.io/lm_data_transparency/). 

Since a lot of the LM benchmarks are limited in a few choices, we can easily calculate the distribution and the expected accuracies for these benchmarks.

I've come to realize that many benchmarks are not very balanced, and the random accuracy can be quite high. This can make it difficult to compare the performance of different models. especially when the model results are lower than the majority class accuracy and the confusion matrix is not provided in almost all of the research papers.

But it is also worth to remember that benchmark distribution != difficulty. A balanced benchmark can still be trivially easy or extremely hard.


## Run
1. Install dependencies: `pip install -r requirements.txt`
2. Add dataset config in `compute_baselines.py`.
3. Run `python compute_baselines.py <benchmark_name>`.
4. Results are saved in output csv file.