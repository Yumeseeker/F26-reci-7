# Reflection

**Name / Andrew ID:**
Brian Zhang / brianz2

**Recitation group members (Task 2):**

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

The invariant that the output should be sorted is valid because the postcondition of mergeIntervals says sorted by start. It killed few mutations because mutants still have sorted output; it would catch a mutant that correctly merges, but doesnt return the list in sorted order.



### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

The `touchingNotMerged` mutant survived because original generator rarely generates two intervals with the same endpoint. I added a specific generator that constructus intervals sharing endpoints.


Before:

```text
touchingNotMerged       flaky: killed in 1/5 runs
```

After:

```text
 touchingNotMerged       killed  by: returns non-overlapping output
```

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

Counterexample: [[[0,0],[1,1]]]

This exposes `mergesIntegerNeighbors`. The mutant merges those intervals when they shouldn't be, because the specification requires nonoverlapping to remain discrete, and [0,0] and [1,1] are nonoverlapping.


### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

The newly added service would benefit.

- **Invariant:** Every non-null `parent_id` points to a real label.
- **Conditional:** Two labels may have the same name only when they have
  different parents; siblings must have unique names case-insensitively.

The generator should construct heirarchys of labels with unique IDs, having parent_id of existing labels or null for root labels. It should also attempt to create cycles or nonexistent labels. A naive generator wouldnt catch those.
