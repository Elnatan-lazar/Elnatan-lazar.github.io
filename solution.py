def getMinOperations(source, target):
    n = len(source)
    d = [target[i] - source[i] for i in range(n)]

    # Each operation adds 1 to a prefix [0..i] or suffix [i..n-1].
    # Decompose d = A + B, A non-increasing (prefix contributions), B non-decreasing (suffix contributions).
    # Optimal A[i] = sum of future drops from position i → must be ≤ d[i], else infeasible.
    fd = 0  # future_drops for current position
    for i in range(n - 1, -1, -1):
        if fd > d[i]:
            return -1
        if i > 0:
            fd += max(0, d[i - 1] - d[i])

    # Total ops = A[0] + B[n-1] = d[n-1] + total_drops = d[0] + total_rises
    return d[0] + sum(max(0, d[i] - d[i - 1]) for i in range(1, n))


if __name__ == "__main__":
    # Example from the problem: source=[1,2,2], target=[2,2,3] → expected 2
    print(getMinOperations([1, 2, 2], [2, 2, 3]))  # 2

    # Infeasible: source=[0,0,0], target=[0,2,0] (can't isolate middle element)
    print(getMinOperations([0, 0, 0], [0, 2, 0]))  # -1

    # Monotone increasing d=[1,2,3]: 3 ops
    print(getMinOperations([0, 0, 0], [1, 2, 3]))  # 3

    # Monotone decreasing d=[3,2,1]: 3 ops
    print(getMinOperations([0, 0, 0], [3, 2, 1]))  # 3

    # target < source → infeasible
    print(getMinOperations([5, 1, 1], [1, 1, 1]))  # -1
