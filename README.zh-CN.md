# DeepRouter 中文说明

DeepRouter 是基于 [QuantumNous/new-api](https://github.com/QuantumNous/new-api) 的工程化 fork。上游 `new-api` 提供了成熟的 OpenAI 兼容网关、渠道管理、额度、日志、Admin UI 和多 provider adapter。DeepRouter 在这个基础上增加了更适合真实产品落地的多租户策略层、儿童安全模式、智能模型路由和计费 webhook 架构。

主 README 使用英文，是为了方便海外招聘经理、工程师和潜在雇主快速理解这个项目的技术价值。中文说明保留在本文件，便于中文读者了解背景。

## 项目定位

DeepRouter 不是简单换名的 fork。它把 `new-api` 的通用 AI gateway 改造成一个更偏产品级的 LLM gateway：

- 对外保持 OpenAI-compatible `/v1` API。
- 对内支持多个模型供应商和多把 provider key。
- 通过 `deeprouter-auto` 虚拟模型接入 smart-router sidecar。
- 为不同租户应用不同 policy。
- 对儿童/教育场景提供硬约束安全模式。
- 为下游业务系统预留按请求计费 webhook。
- 提供官方精选的 Skill Marketplace，作为订阅的内容价值与留存层。

## 我在 fork 上做的主要工作

| 模块 | 说明 |
|---|---|
| `internal/policy/` | 把 `kids_mode` 和 `policy_profile` 转换成统一的请求决策。 |
| `internal/kids/` | 实现模型白名单、metadata 脱敏、OpenAI ZDR、child-safe system prompt。 |
| `relay/airbotix_policy.go` | 在 relay 层、provider 转换前应用安全策略。 |
| `middleware/smart_router.go` | 支持 `deeprouter-auto` 虚拟模型，调用 smart-router sidecar 后改写成具体模型。 |
| `internal/smart_router_client/` | smart-router HTTP client，带超时、熔断和降级逻辑。 |
| `internal/billing/` | HMAC 签名计费 webhook dispatcher，支持 transient retry。 |
| `internal/skill/` + `router/skill-router.go` | Skill Marketplace 后端：市场/我的 Skills/下载/telemetry/admin/ops 六组路由，分层定价与权限矩阵，relay 使用时鉴权，analytics 与通知。 |
| `web/default/src/features/{marketplace,admin-skills,skill-analytics,user-home}/` | Skill Marketplace 前端：市场浏览与详情、付费墙、我的/收藏 Skills、管理端发布工作流、运营分析面板和个性化 User Home。 |
| `model/user.go` | 扩展用户表字段：`kids_mode`、`policy_profile`、`billing_webhook_url`、`custom_pricing_id`、`webhook_secret`。 |
| 文档 | 增加架构、部署、kids coverage matrix、开发流程和 fork 意图说明。 |

## Kids Mode

`kids_mode` 是给儿童和教育产品使用的硬约束模式。开启后，DeepRouter 会在请求发给上游模型之前执行：

1. 非白名单模型直接拒绝。
2. 删除 `user`、`kid_profile_id`、`family_id` 等身份相关 metadata。
3. 对 OpenAI / Azure OpenAI 请求强制 `store: false`。
4. 注入或替换 child-safe system prompt。

相关测试覆盖见 [docs/kids-coverage-matrix.md](./docs/kids-coverage-matrix.md)。

## 智能路由

DeepRouter 把路由拆成两层：

```text
deeprouter-auto
  -> smart-router 选择具体模型
  -> new-api channel cache 选择可用 provider key
  -> relay adapter 转换并调用上游
```

这样既能保留上游 `new-api` 的渠道调度能力，也能把模型选择逻辑放在独立 sidecar 中演进。

## Skill Marketplace（已实现）

Skill Marketplace 是网关之上的产品层：一个**官方精选的 AI Skill 市场**。用户在市场浏览、解锁 Skill，在 Playground 中使用，或下载 Skill 包在本地 runner 中运行。一个 "Skill" 由服务端托管的指令模板加上它的权限、定价、安全和执行配置组成，通过带版本管理的 Super Admin 工作流发布。目前只有官方精选 Skill（用户上传和创作者分成是后续规划）；市场是为 DeepRouter 订阅持续提供内容价值的留存层。它从 [docs/skill-marketplace/](./docs/skill-marketplace/) 的模块化 PRD 起步，现已端到端落地。

已上线的产品闭环：

```text
Super Admin 创建 Skill，迭代版本，激活并发布
  -> 用户在 /skills 浏览（评分、下载数、New / Trending / Popular / PLUS / Kids 徽章）和排行榜
  -> 用户解锁：免费 / 订阅计划内含 / USD 2 一次性购买 / PLUS 专享
  -> 用户在 Playground 使用，或下载 Skill 包到本地 runner
  -> Relay 在执行时重新校验权限、生命周期和 Kids 安全
  -> 归因 usage / billing / analytics / audit
  -> Operations 监控采用率、转化漏斗、类别需求和收入
```

已实现的能力：

- **市场门户**：`/skills` 浏览、搜索、分类过滤；详情页、收藏、星级评分与评价、举报；下载排行榜与共同下载推荐；曝光/详情/收藏/下载/购买全链路事件归因。`/skills/my` 和 `/skills/saved` 管理个人 Skill 库。内置免费示例 Skill（Polished Writer、Faithful Translator、Code Helper、Data Analyst）和 Pro 付费 Skill。
- **分层定价**：共享的权限矩阵覆盖 `free`、`plan_included`、`one_time`（USD 2 永久解锁）、`plus_exclusive` 四种模式；付费墙提供 `Unlock $2` 与 `Get PLUS` 双 CTA；一次性购买接入 referral 双边奖励，且发奖失败绝不回滚购买。
- **使用时鉴权**：解锁 ≠ 永久授权。`internal/skill/relay` 在每次执行时重新解析计划、订阅、一次性 entitlement、生命周期和 Kids 状态，失败映射到稳定错误码（`SKILL_PLAN_REQUIRED`、`SKILL_KIDS_MODE_BLOCKED` 等）；被拦截的调用记录为可审计的 usage 事件。
- **个性化用户界面**：User Home（`/home`）聚合钱包余额、订阅、购买记录、收藏 Skill 和个人推荐。
- **Skill 包下载与 runner telemetry**：按 entitlement 门控的下载包采用 Claude Code 兼容格式（`SKILL.md` 入口、`manifest.json`、指令模板、可选 scripts/references）并附带 runner，解压到 `.claude/skills/` 即可在用户已有工具中使用。runner 用量通过 `POST /api/v1/telemetry/skill-usage` 回传，由服务端按用户 telemetry consent 门控；含 prompt 或原始 provider 数据的 payload 直接拒绝、不落库。
- **默认隐私的 analytics**：用量分析只做聚合，不存 prompt 原文和原始用户输入；Kids 用量做假名化。Super Admin 用户级明细（`GET /api/v1/admin/users/:user_id/skill-usage`）按 consent 门控、每次访问写审计，且永不返回原始 payload。用户在 Profile → Privacy 自助开关 Tier 2 telemetry consent，管理员不能代开。
- **运营与增长**：Skill Analytics 面板（`/skill-analytics`）报告采用率、转化漏斗、类别需求和商业化关联漏斗（充值 → 首次使用 Skill、使用 Skill → 复购充值）；通知后端发送 opt-in 的每周 Top Skills digest 和召回提醒。
- **管理端工具**：Super Admin 的 Skill 与版本 CRUD、激活/发布生命周期、per-skill 审计日志（模板变更只审计 `sha256`，不记录 prompt 原文）和定价配置。

代码位置：后端在 `internal/skill/`（handler、model、relay、pricing、tiers、availability、analytics、enums、errcodes、notify、packageassets、seed），路由在 `router/skill-router.go`（marketplace / my-skills / download / telemetry / admin / ops 六组），前端在 `web/default/src/features/` 的 `marketplace/`、`user-home/`、`skill-analytics/`、`admin-skills/` 以及 Playground 和 Pricing 的集成。设计 source of truth 在 [docs/skill-marketplace/](./docs/skill-marketplace/)。

## 本地运行

```bash
git clone https://github.com/deeprouter-ai/deeprouter.git
cd deeprouter
docker compose up -d
```

打开 `http://localhost:3000`，注册第一个账号作为 root admin，然后在 Admin UI 中添加 provider channel 和 token。

测试请求：

```bash
TOKEN=sk-your-deeprouter-token

curl http://localhost:3000/v1/chat/completions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Say hello in five words."}
    ]
  }'
```

## 本页的重点

英文 README 更适合作为 GitHub 首页，因为它能直接说明：

- 这个 fork 和 upstream 的关系是什么。
- 你具体新增了哪些后端模块。
- 这些模块解决了什么真实产品问题。
- 哪些功能已经实现，哪些还在计划中。
- 项目架构是否清晰、可测试、可维护。

## 许可证

DeepRouter 继承上游 `QuantumNous/new-api` 的 AGPL-3.0 许可证。
