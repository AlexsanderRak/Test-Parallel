import lodash from "lodash";

type doneType = (value: donePropsType) => void;
type jobsType = Array<jobType>;
type jobType = () => Promise<donePropsType>;
type resultType = donePropsType[];
type donePropsType = string;

class Parallel {
  private parallelJobs: number = 2;
  private jobs: jobsType = [];

  constructor(props: { parallelJobs: number }) {
    this.parallelJobs = props.parallelJobs;
  }

  private jobsReset() {
    this.jobs = [];
  }

  public job(func: (done: doneType) => void) {
    const jobPromise: jobType = () => new Promise((resolve) => func(resolve));
    this.jobs.push(jobPromise);

    return this;
  }

  public async done(onDone: (results: resultType) => void) {
    const chunks = lodash.chunk(this.jobs, this.parallelJobs);
    const result: resultType = [];

    for (const chunk of chunks) {
      const promises = chunk.map((job) => job());
      const response = await Promise.allSettled<string>(promises);

      for (const item of response) {
        if (item.status === "fulfilled") {
          result.push(item.value);
        }
      }
    }
    this.jobsReset();
    onDone(result);
  }
}

const runner = new Parallel({
  parallelJobs: 2,
});

runner.job(step1).job(step2).job(step3).job(step4).done(onDone);

function step1(done: doneType): void {
  setTimeout(done, 100, "step1");
}

function step2(done: doneType): void {
  setTimeout(done, 10, "step2");
}

function step3(done: doneType): void {
  setTimeout(done, 150, "step3");
}

function step4(done: doneType): void {
  setTimeout(done, 50, "step4");
}

function onDone(results: resultType) {
  console.assert(Array.isArray(results), "result must be an array");
  console.assert(results.length == 4, "Wrong count of answers");
  console.assert(results[0] === "step1", "Wrong answer 1");
  console.assert(results[1] === "step2", "Wrong answer 2");
  console.assert(results[2] === "step3", "Wrong answer 3");
  console.assert(results[3] === "step4", "Wrong answer 4");
}
