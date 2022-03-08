import lodash from "lodash";

type DoneType = (value: DonePropsType) => void;
type JobsType = Array<JobType>;
type JobType = () => Promise<DonePropsType>;
type ResultType = DonePropsType[];
type DonePropsType = string;

class Parallel {
  private parallelJobs: number = 2;
  private jobs: JobsType = [];

  constructor(props: { parallelJobs: number }) {
    this.parallelJobs = props.parallelJobs;
  }

  private jobsReset() {
    this.jobs = [];
  }

  public job(jobFunc: (done: DoneType) => void) {
    const jobPromise: JobType = () => new Promise((resolve, reject) => jobFunc(resolve));
    this.jobs.push(jobPromise);

    return this;
  }

  public async done(onDone: (results: ResultType) => void) {
    const chunks = lodash.chunk(this.jobs, this.parallelJobs);
    const result: ResultType = [];

    for (const chunk of chunks) {
      const promises = chunk.map((job) => job());
      const response = await Promise.allSettled<string>(promises);

      console.log(response)
      
      for (const item of response) {
        if (item.status === "fulfilled") {
          result.push(item.value);
        }
        if (item.status === "rejected") {
          result.push(item.reason);
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

function step1(done: DoneType): void {
  setTimeout(done, 100, "step1");
}

function step2(done: DoneType): void {
  setTimeout(done, 10, 'step2');
}

function step3(done: DoneType): void {
  setTimeout(done, 150, "step3");
}

function step4(done: DoneType): void {
  setTimeout(done, 50, "step4");
}

function onDone(results: ResultType) {
  console.assert(Array.isArray(results), "result must be an array");
  console.assert(results.length == 4, "Wrong count of answers");
  console.assert(results[0] === "step1", "Wrong answer 1");
  console.assert(results[1] === "step2", "Wrong answer 2");
  console.assert(results[2] === "step3", "Wrong answer 3");
  console.assert(results[3] === "step4", "Wrong answer 4");
}
