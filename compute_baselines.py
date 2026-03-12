import argparse
import pandas as pd
from datasets import load_dataset
from collections import Counter
import json

DATASET_CONFIGS = {
    "arc_challenge": {"path": "ai2_arc", "name": "ARC-Challenge", "split": "test", "label_col": "answerKey", "num_classes": 4},
    "arc_easy": {"path": "ai2_arc", "name": "ARC-Easy", "split": "test", "label_col": "answerKey", "num_classes": 4},
    "boolq": {"path": "super_glue", "name": "boolq", "split": "validation", "label_col": "label", "num_classes": 2},
    "copa": {"path": "super_glue", "name": "copa", "split": "validation", "label_col": "label", "num_classes": 2},
    "hellaswag": {"path": "Rowan/hellaswag", "name": None, "split": "validation", "label_col": "label", "num_classes": 4},
    "mnli": {"path": "glue", "name": "mnli", "split": "validation_matched", "label_col": "label", "num_classes": 3},
    "openbookqa": {"path": "openbookqa", "name": "main", "split": "test", "label_col": "answerKey", "num_classes": 4},
    "piqa": {"path": "piqa", "name": None, "split": "validation", "label_col": "label", "num_classes": 2},
    "wic": {"path": "super_glue", "name": "wic", "split": "validation", "label_col": "label", "num_classes": 2},
    "winogrande": {"path": "winogrande", "name": "winogrande_xl", "split": "validation", "label_col": "answer", "num_classes": 2},
    "wsc": {"path": "super_glue", "name": "wsc.fixed", "split": "validation", "label_col": "label", "num_classes": 2}
}

def compute_metrics(benchmark):
    if benchmark not in DATASET_CONFIGS:
        raise ValueError(f"Benchmark {benchmark} is not configured.")
        
    config = DATASET_CONFIGS[benchmark]
    print(f"Loading {benchmark}...")
    
    if config["name"]:
        dataset = load_dataset(config["path"], config["name"], split=config["split"], trust_remote_code=True)
    else:
        dataset = load_dataset(config["path"], split=config["split"], trust_remote_code=True)
        
    labels = dataset[config["label_col"]]
    
    # Preprocess labels to string to unify types
    labels = [str(l) for l in labels if l is not None]
    
    total_count = len(labels)
    counts = Counter(labels)
    
    # Default to the max of observed classes or configured num_classes
    num_classes = max(len(counts), config.get("num_classes", len(counts)))
    
    distribution = {k: f"{v} ({v/total_count:.2%})" for k, v in counts.items()}
    
    # Majority class baseline
    majority_count = max(counts.values())
    majority_acc = majority_count / total_count
    
    # Uniform random expected accuracy
    uniform_random_acc = 1.0 / num_classes
    
    # Proportional random expected accuracy
    # Sum of square of proportions
    proportional_random_acc = sum((count / total_count) ** 2 for count in counts.values())
    
    return {
        "Benchmark": benchmark,
        "Total Examples": total_count,
        "Num Classes": num_classes,
        "Distribution": json.dumps(distribution),
        "Majority Class Acc": majority_acc,
        "Uniform Random Acc": uniform_random_acc,
        "Proportional Random Acc": proportional_random_acc
    }

def main():
    parser = argparse.ArgumentParser(description="Investigate data distribution of benchmarks.")
    parser.add_argument("benchmarks", nargs="+", help="List of benchmarks to investigate.")
    parser.add_argument("--output", type=str, default="benchmark_distributions.csv", help="Output CSV file path.")
    
    args = parser.parse_args()
    
    results = []
    for benchmark in args.benchmarks:
        try:
            res = compute_metrics(benchmark)
            results.append(res)
        except Exception as e:
            print(f"Error processing {benchmark}: {e}")
            
    if results:
        df = pd.DataFrame(results)
        df.to_csv(args.output, index=False)
        print(f"\nResults saved to {args.output}")
        # print first few rows nicely
        print(df.to_string(index=False))
    else:
        print("No benchmarks were successfully processed.")

if __name__ == "__main__":
    main()
