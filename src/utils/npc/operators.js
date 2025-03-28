import { getTable } from "./tables";
import { chooseRandomWithWeight } from "./utils";
import { Operator } from "./types";

function isNumber(n) {
  return typeof n === "number";
}

export const operators = [
  // {%v1=%v2}
  {
    regex: /^{%(.+)=%(.*)}/,
    makeOperator(m) {
      const v1 = m[1];
      const v2 = m[2];
      return new Operator((context) => {
        context.vars[v1] = +context.vars[v2];
      }, m[0]);
    },
  },
  // {%v1=15}
  {
    regex: /^{%(.+)=(.*)}/,
    makeOperator(m) {
      const v1 = m[1];
      const value = +m[2];
      return new Operator((context) => {
        context.vars[v1] = value;
      }, m[0]);
    },
  },
  // {%v1+%v2}
  {
    regex: /^{%(.+)\+%(.*)}/,
    makeOperator(m) {
      const v1 = m[1];
      const v2 = m[2];
      return new Operator((context) => {
        context.vars[v1] = +context.vars[v1] + +context.vars[v2];
      }, m[0]);
    },
  },
  // {%v1+15}
  {
    regex: /^{%(.+)\+(.*)}/,
    makeOperator(m) {
      const v1 = m[1];
      const value = +m[2];
      return new Operator((context) => {
        context.vars[v1] = +context.vars[v1] + value;
      }, m[0]);
    },
  },
  // {%v1-%v2}
  {
    regex: /^{%(.+)-%(.*)}/,
    makeOperator(m) {
      const v1 = m[1];
      const v2 = m[2];
      return new Operator((context) => {
        context.vars[v1] = +context.vars[v1] - +context.vars[v2];
      }, m[0]);
    },
  },
  // {%v1-15}
  {
    regex: /^{%(.+)-(.*)}/,
    makeOperator(m) {
      const v1 = m[1];
      const value = +m[2];
      return new Operator((context) => {
        context.vars[v1] = +context.vars[v1] - value;
      }, m[0]);
    },
  },
  // {%v1}
  {
    regex: /^{%(.+)}/,
    makeOperator(m) {
      const v1 = m[1];
      return new Operator((context) => {
        return +context.vars[v1] | 0;
      }, m[0]);
    },
  },
  // {$s1=$s2}
  {
    regex: /^{\$(.+)=\$(.*)}/,
    makeOperator(m) {
      const s1 = m[1];
      const s2 = m[2];
      return new Operator((context) => {
        context.vars[s1] = String(context.vars[s2]);
      }, m[0]);
    },
  },
  // {$s1=du text lala.}
  {
    regex: /^{\$(.+)=(.*)}/,
    makeOperator(m) {
      const s1 = m[1];
      const text = m[2];
      return new Operator((context) => {
        context.vars[s1] = text;
      }, m[0]);
    },
  },
  // {$s1+$s2}
  {
    regex: /^{\$(.+)\+\$(.*)}/,
    makeOperator(m) {
      const s1 = m[1];
      const s2 = m[2];
      return new Operator((context) => {
        context.vars[s1] += String(context.vars[s2]);
      }, m[0]);
    },
  },
  // {$s1+du text lala.}
  {
    regex: /^{\$(.+)\+(.*)}/,
    makeOperator(m) {
      const s1 = m[1];
      const text = m[2];
      return new Operator((context) => {
        context.vars[s1] += text;
      }, m[0]);
    },
  },
  // {$s1}
  {
    regex: /^{\$(.+)}/,
    makeOperator(m) {
      const s1 = m[1];
      return new Operator((context) => {
        return context.vars[s1];
      }, m[0]);
    },
  },
  // {\n}
  {
    regex: /^{\\n}$/,
    makeOperator() {
      return new Operator(() => {
        return "\n";
      });
    },
  },
  // {table}
  {
    regex: /^{(.*)}/,
    makeOperator(m) {
      const tablename = m[1];
      return new Operator((context, options) => {
        const t = getTable(tablename);
        function chooseOption(index) {
          if (index >>> 0 >= t.options.length) {
            console.warn?.("Index [%d] for table [%s]", index, tablename);
            return chooseRandomWithWeight(t.options, t.w);
          }
          return t.options[index].v;
        }

        if (tablename === "race" && isNumber(options.race)) {
          return chooseOption(options.race);
        } else if (tablename === "forcealign" && isNumber(options.alignment)) {
          return chooseOption(options.alignment);
        } else if (tablename === "hooks" && isNumber(options.plothook)) {
          return chooseOption(options.plothook);
        } else if (tablename.match(/gender$/) && isNumber(options.gender)) {
          return chooseOption(options.gender);
        }

        if (
          isNumber(options.subrace) &&
          (tablename === "raceelf" ||
            tablename === "racedwarf" ||
            tablename === "racegnome" ||
            tablename === "racehalfling" ||
            tablename === "racegenasi")
        ) {
          return chooseOption(options.subrace);
        }

        if (isNumber(options.classorprof)) {
          if (tablename === "occupation") {
            return chooseOption(options.classorprof);
          } else if (
            isNumber(options.occupation1) &&
            options.classorprof === 0 &&
            tablename === "class"
          ) {
            return chooseOption(options.occupation1);
          } else if (
            isNumber(options.occupation1) &&
            options.classorprof === 1 &&
            tablename === "profession"
          ) {
            return chooseOption(options.occupation1);
          } else if (
            isNumber(options.occupation1) &&
            isNumber(options.occupation2) &&
            options.classorprof === 1 &&
            (tablename === "learned" ||
              tablename === "lesserNobility" ||
              tablename === "professional" ||
              tablename === "workClass" ||
              tablename === "martial" ||
              tablename === "underclass" ||
              tablename === "entertainer")
          ) {
            return chooseOption(options.occupation2);
          }
        }

        return chooseRandomWithWeight(t.options, t.w);
      }, m[0]);
    },
  },
];
