---
title: "Elasticsearch 다른 index join (Enrich & Ingest Pipeline)"
toc: true
toc_label: "Elasticsearch 다른 index join (Enrich)"
toc_icon: "tags"
toc_sticky: true
---
## Enrich
- Elasticsearch는 서로 다른 Index를 Join한다는 개념이 없고, Enrich를 이용하여 다른 Index의 내용을 합친 후 인덱싱해서 사용한다.

## Enrich policy 생성
```bash
# enrich policy 생성
PUT /_enrich/policy/enrich-policy-test
{
    "match": {
        "indices": "cms-metadata",
        "match_field": "program_id",
        "enrich_fields": ["program_title", "series_id", "season_no", "episode_no", "main_company", "sub_company", "cp"]
    }
}
 
# enrich policy 확인
GET /_enrich/policy/enrich-policy-test
```

## Enrich policy 실행
```bash
# enrich policy 실행
POST /_enrich/policy/enrich-policy-test/_execute
```

## Ingest pipeline 생성
```bash
# ingest pipeline 생성
PUT /_ingest/pipeline/ingest-pipeline-test
{
    "processors": [
        {
            "enrich": {
                "policy_name": "enrich-policy-test",
                "field": "program_id",
                "target_field": "program_info",
                "max_matches": 1
            }
        }
    ]
}
```

## Ingest pipeline 테스트
```bash
POST _ingest/pipeline/ingest-pipeline-test/_simulate
{
    "docs": [
        {
            "_source": {
                enrich policy 적용 여부 확인을 위해 document 내용을 넣어본다
            }
        }
    ]
}
```

## Logstash에 pipeline 적용
```ini
# logstash conf 파일 수정

#[중략]
 
elasticsearch {
    hosts => ["localhost:9200"]
    pipeline => "ingest-pipeline-test"
    index => "index-%{date}"
}
```