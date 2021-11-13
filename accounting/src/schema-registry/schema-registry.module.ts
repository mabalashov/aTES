import {DynamicModule, Global, Module, Provider} from '@nestjs/common';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {SchemaRegistry} from "@kafkajs/confluent-schema-registry";

@Global()
@Module({})
export class SchemaRegistryModule {
  static forRootAsync(): DynamicModule {
    const asyncOptions = this.createAsyncOptionsProvider();

    return {
      module: SchemaRegistryModule,
      providers: [asyncOptions],
      imports: [ConfigModule],
      exports: ['SCHEMA_REGISTRY']
    };
  }

  private static createAsyncOptionsProvider(): Provider {
    return {
      provide: 'SCHEMA_REGISTRY',
      useFactory: async (configService: ConfigService) => {
        return new SchemaRegistry({
          host: configService.get('schema_registry.host'),
        });
      },
      inject: [ConfigService],
    }
  }
}
